import { Request, Response } from "express";
import {
  findByEmailOrMobileNo,
  signup,
  updateClient,
  checkUserExist,
  getClientsOfAgency
} from "../service/user.service";
import log from "../logger";
import _ from 'lodash';
import config from 'config';
import { sign } from "../utils/jwt.utils";
import { Types } from "mongoose";

export async function createUserHandler(req: Request, res: Response) {
  try {
    let params = req.body;
    let register: any, authToken;
    let isUserExist: any = await findByEmailOrMobileNo(params);
    if (isUserExist && isUserExist.email === params.email)
      return res.status(409).send({ status: 409, message: "Email Already exist", data: {} });
    else if (isUserExist && isUserExist?.countryCode === params.countryCode && isUserExist.mobileNo === params.mobileNo)
      return res.status(409).send({ status: 409, message: "Mobile no Already exist", data: {} });
    else {
      register = await signup(params);
      register = _.omit(register.toJSON(), "password")
      let tokenData = _.extend(params, {
        "userId": register?._id,
        "fullName": register?.fullName,
        "countryCode": register?.countryCode,
        "mobileNo": register?.mobileNo,
        "email": register?.email,
      });
      authToken = sign(tokenData, { algorithm: config.get("jwtalgo"), expiresIn: config.get("accessTokenTtl") }); // 180 days
    }
    let resp = (params?.userType === 1) ? { clientData: register } : { agencyData: register }
    return res.send({ status: 200, message: "User created succussfully", data: { authToken, ...resp } });

  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}

export async function editUserHandler(req: Request, res: Response) {
  try {
    let params = req.body;
    let clientData: any, authToken;
    let isUserExist: any = await checkUserExist(params);
    if (!isUserExist) {
      return res.status(409).send({ status: 409, message: "User not exist", data: {} });

    } else {
      clientData = await updateClient(params);
      clientData = _.omit(clientData, "password");
      let tokenData = _.extend(params, {
        "userId": clientData?._id,
        "fullName": clientData?.fullName,
        "countryCode": clientData?.countryCode,
        "mobileNo": clientData?.mobileNo,
        "email": clientData?.email,
      });
      authToken = await sign(tokenData, { algorithm: config.get("jwtalgo"), expiresIn: config.get("accessTokenTtl") }); // 180 days
    }
    return res.send({ status: 201, message: "User created succussfully", data: { authToken, clientData } });

  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}

export async function getAgencyClientHandler(req: any, res: Response) {
  try {
    let userId = req?.user?.userId;
    console.log("🚀 ~ file: user.controller.ts:75 ~ getAgencyClientHandler ~ userId", userId)

    const pipeline = [
      {
        $match: {
          _id: Types.ObjectId(userId),
          status: { $ne: "DELETED" }
        }
      },
      {
        $lookup: {
          from: "clients",
          let: { agencyId: "$_id", status: "DELETED" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and:
                    [
                      { $eq: ["$agencyId", "$$agencyId"] },
                      { $ne: ["$status", "$$status"] }
                    ]
                }
              }
            },
            { $sort: { totalBill: -1 } },
            { $limit: 10 },    //this is because of top 10 client of agency
            { $project: { _id: 1, fullName: 1, totalBill: 1, email: 1 } }
          ],
          as: "clientData"
        }
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
          clientData: 1
        }
      }

    ]
    const resp = await getClientsOfAgency(pipeline);

    return res.send({ status: 200, message: "Data fetched succussfully", data: resp });

  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}
