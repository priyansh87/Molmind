import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import dotenv from 'dotenv'
dotenv.config({}) ;
export const protect = async (req, res, next) => {
  try {
    let token;
    // console.log("in auth middleware",req?.headers?.authorization)

    
    if (
      req.headers.authorization.startsWith('bearer')
    ) {
        console.log("in auth middleware")
      token = req.headers.authorization.split(' ')[1];
    
    }
    // ✅ 2. Check cookie if header isn't present
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // console.log(token)
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }
    console.log("here",process.env.ACCESS_TOKEN_SECRET)
  
    
    const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    console.log("decoded is equal to = ", decoded)
    console.log(decoded.userid)

    
    const userExists = await User.findById(decoded.userid);
    if (!userExists) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user does not exist',
      });
    }

    
    req.user = decoded;
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
      error: error.message,
    });
  }
};
