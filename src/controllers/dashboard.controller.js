import mongoose from "mongoose";
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    });

    if (!user) {
        throw new ApiError(404, "Invalid User");
    }

    try {
        const totalVideos = await Video.countDocuments({ owner: user._id });

        const totalVideoViews = await Video.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(user._id) } },
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]);

        const totalViews = totalVideoViews[0] ? totalVideoViews[0].totalViews : 0;

        const totalSubscribers = await Subscription.countDocuments({ channel: user._id });

        const totalLikes = await Like.countDocuments({ likedBy: user._id, video: { $ne: null } });

        return res.status(200).json(new ApiResponse(200, {
            totalVideos,
            totalViews,
            totalSubscribers,
            totalLikes
        }, "Channel stats retrieved successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, `Something went wrong: ${error}`);
    }
});

const getChannelVideos = asyncHandler(async(req, res) => {
    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid User")
    }

    const videos = await Video.find({ owner: user?._id})

    if(!videos || videos.length === 0){
        throw new ApiError(500, "Error while fetching the videos")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, videos, "Vdios fetched Successfully "))

})

export {getChannelStats, getChannelVideos}