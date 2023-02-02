import { get } from "lodash";
import { Request, Response, NextFunction } from "express";
import { decode } from "../utils/jwt.utils";

const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {

  const accessToken = get(req, "headers.authorization", "").replace(/^Bearer\s/, "");

  if (!accessToken) return next();

  const { decoded, expired } = decode(accessToken);
  console.log(decoded, "<<<<<<<<<<<<<<DECODEDD<>>>>>>>>>>>>>>>>>>>>>>>");

  if (decoded) {
    // @ts-ignore
    req.user = decoded;
    return next();
  }

  return next();
};

export default deserializeUser;
