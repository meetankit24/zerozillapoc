import Client from "../model/client.model";
import Agency from "../model/agency.model";
import log from "../logger";


export async function findByEmailOrMobileNo(params) {
  try {
    let query: any = {};
    query["$or"] = [{ "email": params.email }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo }];
    query.status = { $ne: "DELETED" };

    let options: any = { lean: true };
    return (params?.userType === 1) ? await Client.findOne(query, {}, options) : await Agency.findOne(query, {}, options);

  } catch (error: any) {
    log.error(error);
    return { status: 401, message: error.message };
  }
}

export async function checkUserExist(params) {
  try {
    let query: any = {};
    query._id = params?.userId;
    query.status = { $ne: "DELETED" };

    let options: any = { lean: true };
    const resp = await Client.findOne(query, {}, options);

    return resp;

  } catch (error: any) {
    log.error(error);
    return { status: 401, message: error.message };
  }
}

export async function signup(data, options?) {
  try {
    data.createdAt = new Date().getTime();
    return (data?.userType === 1) ?
      await new Client(data).save(options) :
      await new Agency(data).save(options);

  } catch (error: any) {
    log.error(error);
    return { status: 401, message: error.message };
  }

}

export async function updateClient(data, options?) {
  try {
    data.createdAt = new Date().getTime();
    return await Client.findOneAndUpdate({ _id: data?.userId }, data, { new: true })

  } catch (error: any) {
    log.error(error);
    return { status: 401, message: error.message };
  }

}

export async function getClientsOfAgency(pipeline, optons?) {
  try {
    const resp = await Agency.aggregate(pipeline).collation({ locale: "en_US", numericOrdering: true });
    return resp;
  } catch (error: any) {
    log.error(error);
    return { status: 401, message: error.message };
  }

}