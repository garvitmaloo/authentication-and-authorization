import Resource from "../models/resource";
import type { IStandardResponse, IResource } from "../types/index";

export const fetchAllResourcesService = async (
  email: string
): Promise<IStandardResponse<IResource[]>> => {
  try {
    const allUserResources = await Resource.find({ ownerEmail: email });
    return {
      error: null,
      result: allUserResources
    };
  } catch (err) {
    return {
      error: {
        statusCode: 500,
        message: (err as Error).message
      },
      result: null
    };
  }
};
