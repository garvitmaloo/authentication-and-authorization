import { isAuthorized } from "../middleware/authentication";
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

export const createNewResource = async (
  resourceDetails: IResource
): Promise<IStandardResponse<IResource>> => {
  const { ownerEmail, name, type } = resourceDetails;

  try {
    const newResource = new Resource({
      name,
      ownerEmail,
      type
    });
    await newResource.save();

    return {
      error: null,
      result: newResource
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

export const deleteResourceService = async (
  resourceId: string,
  ownerEmail: string
): Promise<IStandardResponse<string>> => {
  try {
    const resource = await Resource.findById(resourceId);

    if (resource === null) {
      return {
        error: {
          statusCode: 404,
          message: "Resource not found"
        },
        result: null
      };
    }

    if (!isAuthorized(ownerEmail, resource)) {
      return {
        error: {
          statusCode: 401,
          message: "You are not authorized to delete this resource"
        },
        result: null
      };
    }

    await resource.deleteOne();
    return {
      error: null,
      result: "Resource deleted successfully"
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
