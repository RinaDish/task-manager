const multer = require('multer');

const isValidOperations = (updates, allowedProps) => updates.every(
  (update) => allowedProps.includes(update),
);

const upload = multer({
  // ToDo: move to separate file
  dest: 'avatars',
  limits: {
    fileSize: 1000000,
  },
  storage: multer.memoryStorage(), // it`s required for buffer field in the file
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(?:jpe?g|png)$/)) return cb(new Error('Invalid file extention'));

    return cb(undefined, true);
  },
});

module.exports = { isValidOperations, upload };
