const getS3 = require('./awsConnect');
const Busboy = require('busboy');
const paramChecker = require('./paramCheck');
const { Readable, PassThrough } = require('stream');
const pako = require('pako');

module.exports = ({request, s3_instance = null, awsCredentials = null, bucket = '', mimeFilter = null, compressed = false, compressionRatio = 1, uploadUrlGen = null, maxSize = null, s3UploadParams = {}, busboyParams = {}} = {}) => new Promise((resolve, reject) => {
  try {
    const paramsInvalid = paramChecker(request, s3_instance, awsCredentials, bucket, compressed, compressionRatio);
    if (paramsInvalid) {
      reject(Error(paramsInvalid));
      return;
    }
    const busboy = new Busboy({ headers: request.headers, ...busboyParams });
    const fields = {};
    const fileUploadPromise = [];
    const s3 = s3_instance || getS3(awsCredentials);
    busboy.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });
    busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
      // to cover for the chrome's bug of incorrect mimetype
      const fileMime = mimetype === 'audio/mp3' ? 'audio/mpeg' : mimetype;
      const extension = filename.split('.')[filename.split('.').length - 1];
      const mimeSupported = mimeFilter ? mimeFilter(fileMime, extension.toLowerCase()) : true;
      const contentLength = Number(request.headers['content-length']);
      if (!mimeSupported) {
        reject(Error('File type not supported'));
        return;
      }
      if (maxSize > 0 && contentLength > maxSize) {
        reject(Error('File size too long'));
        return;
      }

      let Bucket = bucket;

      const uploader = (key) => {
        const passToS3 = new PassThrough();
        const fileReadStream = new Readable({
          read(size) {
            if (!size) this.push(null);
            else this.push();
          },
        });
        const inflate = new pako.Inflate({ level: compressionRatio });
        inflate.onData = (dat) => {
          fileReadStream.push(dat);
        };
        inflate.onEnd = () => {
          fileReadStream.push(null);
        };
        fileUploadPromise.push(new Promise((res, rej) => {
          s3.upload({
            Bucket,
            Key: key,
            Body: passToS3,
            ...s3UploadParams,
          }, (err, data) => {
            if (err) {
              rej(err);
            } else {
              res({ ...data, originalname: filename, fileMime, fields });
            }
          });
        }));
        fileReadStream.pipe(passToS3);
        let nextChunk = null;
        file.on('data', async (data) => {
          if (!compressed && nextChunk) {
            fileReadStream.push(Buffer.from(nextChunk));
          } else if (compressed && nextChunk) {
            inflate.push(nextChunk, false);
          }
          nextChunk = data;
        });
        file.on('end', () => {
          if (!compressed) {
            fileReadStream.push(Buffer.from(nextChunk));
            fileReadStream.push(null);
          } else {
            inflate.push(nextChunk, true);
          }
        });
      }
      const uploadKey = uploadUrlGen ? await uploadUrlGen({fields, fileMime, bucket: Bucket, filename}) : fields.uploadUrl;
      if (uploadKey) {
        uploader(uploadKey);
      } else {
        reject(Error('No upload url provided'));
        return;
      }
    });
    busboy.on('finish', () => {
      Promise.all(fileUploadPromise).then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
    });
    request.pipe(busboy);
  } catch (err) {
    console.log(err);
    reject('Something went wrong');
  }
});
