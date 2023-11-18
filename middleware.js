import chalk from "chalk";
import CONFIGURATION from "./config.json" assert { type: "json" };
import { User } from "./models/user.model.js";
import { VerifyToken } from "./utils.js";

const CheckUserAccessForQueries = async (req, res, next) => {
  try {
    const role = req.user.role;
    const rolePermissions = CONFIGURATION.access_types[role];
    req.rolePermissions = rolePermissions;
    const queryKeys = Object.keys(req.query);
    const allKeysInRolePermissions = queryKeys.every((key) =>
      rolePermissions.includes(key)
    );
    if (!allKeysInRolePermissions) throw new Error();

    next();
  } catch (error) {
    console.log(chalk.red("Error : [CHECK USER ACCESS FOR QUERIES]"), error);
    throw new Error("Access Denied : User Cannot Access These Queries");
  }
};

const CheckIfUserAuthenticated = async (req, res, next) => {
  try {
    // Format be like Bearer `${tokenValue}`
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = await VerifyToken(token);

    req.userId = decodedToken._id;
    const userInDb = User.findById(req.userId);

    if (!userInDb) {
      throw new Error();
    }

    req.user = userInDb;
    next();
  } catch (error) {
    console.log(chalk.red("Error : [CHECK IF USER AUTHENTICATED]"), error);
    throw new Error(
      "Access Denied : User Not Authenticated For Doing Any Queries"
    );
  }
};

export { CheckIfUserAuthenticated, CheckUserAccessForQueries };
