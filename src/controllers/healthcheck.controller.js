import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler((_,res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "Everything is alright"))
})

export {healthcheck}