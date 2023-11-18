import chalk from "chalk";
import { Logs } from "./models/logs.model.js";

const CHUNK_SIZE = 100;

// For Log Ingestor
const InjectData = async (data) => {
  try {
    const promises = [];
    // Rather than a single insertMany , here we create batches of insert many for parellalism
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      promises.push(Logs.insertMany(chunk));
    }

    await Promise.all(promises);
  } catch (error) {
    console.log(chalk.red("Error [INJECT DATA SERVICE :]"), error);
    throw error;
  }
};

// For Query Search

const QuerySearch = async (query, rolePermissions) => {
  try {
    let aggregateFilters = [
      {
        $match: {},
      },
      {
        $project: {
          _id: 1,
        },
      },
    ];

    // Filters for selection based on rolePermissions
    rolePermissions.forEach((key) => {
      aggregateFilters[1].$project[key] = 1;
    });

    // Filters for level
    if (query?.level && query?.level.length > 0) {
      aggregateFilters[0].$match.level = {
        $in: query.level,
      };
    }

    // Filters for message
    if (query?.message && query?.message.length > 0) {
      aggregateFilters[0].$match.message = {
        $regex: query.message,
      };
    }

    // Filters for resourceId
    if (query?.resourceId && query?.resourceId.length > 0) {
      aggregateFilters[0].$match.resourceId = query.resourceId;
    }

    // Filters for spanId
    if (query?.spanId && query?.spanId.length > 0) {
      aggregateFilters[0].$match.spanId = query.spanId;
    }

    // Filters for traceId
    if (query?.traceId && query?.traceId.length > 0) {
      aggregateFilters[0].$match.traceId = query.traceId;
    }

    // Filters for commit
    if (query?.commit && query?.commit.length > 0) {
      aggregateFilters[0].$match.commit = query.commit;
    }

    // Filters for metadata.parentResourceId
    if (
      query["metadata.parentResourceId"] &&
      query["metadata.parentResourceId"].length > 0
    ) {
      aggregateFilters[0].$match["metadata.parentResourceId"] =
        query["metadata.parentResourceId"];
    }

    // Filters for timestamp
    if (query?.timestamp_st && query?.timestamp_end) {
      aggregateFilters[0].$match.timestamp = {
        $gte: query.timestamp_st,
        $lte: query.timestamp_end,
      };
    }

    // Now the final search
    const res = await Logs.aggregate(aggregateFilters);

    return res;
  } catch (error) {
    console.log(chalk.red("Error [QUERY SEARCH SERVICE :]"), error);
    throw error;
  }
};

export { InjectData, QuerySearch };
