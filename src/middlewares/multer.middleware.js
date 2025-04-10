import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
      // waise to original naam se nhi karna chahiye but file apne local server pe thode time ke liye hi hai
    }
  })
  
  export const upload = multer({ storage: storage })