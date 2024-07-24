import mongoose from "mongoose";
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadVideoOnCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async(req, res) => {
    const {page=1, limit=10, query="", sortBy, sortType, userId} = req.query

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "User doesn't exist")
    }

    const pageNumber = parseInt(page);
    const limitOfComments = parseInt(limit);

    const skip = (pageNumber-1) * limitOfComments;

    const pageSize = limitOfComments;

    const videos = await Video.aggregatePaginate(
        Video.aggregate([
            {
                $match: {
                    $or: [
                        {title: {$regex: query, $options: 'i'}},
                        {description: {$regex: query, $options: "i"}}
                    ],
                    isPublished: true,
                    owner: userId
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    likes: {$size: "$likes"}
                }
            },
            {
                $project: {
                    "_id": 1,
                    "vidoeFile": 1,
                    "thumbnail": 1,
                    "title": 1,
                    "description": 1,
                    "duration": 1,
                    "views": 1,
                    "isPublished": 1,
                    "owner": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "likes": 1
                }
            },
            {$sort: { [sortBy]: sortType === 'asc' ? 1 : -1}},
            {$skip: skip},
            {$limit: pageSize}
        ])
    )

    if(!videos){
        throw new ApiError(500, "Error in fetching videos")
    }

    if(videos.length === 0){
        return res
                .status(200)
                .json(new ApiResponse(200, "No videos are available"))
    }

    return res
            .status(200)
            .json(new ApiResponse(200, videos, "Videos fetched successfully"))

})

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and Description are required");
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const videoFilePath = req.files?.videoFile[0].path;
    const thumbnailPath = req.files?.thumbnail[0].path;

    if (!videoFilePath || !thumbnailPath) {
        throw new ApiError(400, "Video and Thumbnail are required");
    }

    const videoFile = await uploadVideoOnCloudinary(videoFilePath);
    const thumbnail = await uploadOnCloudinary(thumbnailPath);

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Problem in uploading video or thumbnail");
    }

    const duration = await videoFile.duration;

    if (!duration) {
        throw new ApiError(500, "Problem in fetching video duration");
    }

    const video = await Video.create({
        videoFile:videoFile.secure_url,
        thumbnail:thumbnail.secure_url,
        title,
        description,
        duration,
        isPublished: true,
        owner: user._id
    });

    if (!video) {
        throw new ApiError(500, "Problem in publishing Video");
    }

    return res.status(200).json({ status: 200, video, message: "Successfully published Video" });
});

const getVideoById = asyncHandler(async(req, res) => {
    const { videoId } = req.params

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(404, "Invalid Object Id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid User")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "Invalid Video Id")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, video, "Successfully fetched Video"))
})

const updateVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params
    const {title, description} = req.body;
    const thumbnailPath = req.files?.thumbnail ? req.files.thumbnail[0].path : null;

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(404, "Invalid object Id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid User")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    if(title){
        video.title = title;
    }

    if(description){
        video.description = description;
    }

    if(thumbnailPath){
        const thumbnail = await uploadOnCloudinary(thumbnailPath);
        if(!thumbnail){
            throw new ApiError(500, "Problem in uploading new thumbnail")
        }

        video.thumbnail = thumbnail.secure_url;
    }

    await video.save()

    return res
            .status(200)
            .json(new ApiResponse(200, video, "Successfully updated video"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(404, "Invalid Object id")
    }

    const user = await User.findOne({
        refreshToken : req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid User")
    }

    const video = await Video.findByIdAndDelete(videoId)

    if(!video){
        throw new ApiError(400, "Invalid video id")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,video, "Successfully deleted Video"))

})

const togglePublishStatus = asyncHandler(async(req, res) => {
    const { videoId } = req.params

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(404, "Invalid object id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid User")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "Invalid video id")
    }

    video.isPublished = !video.isPublished
    await video.save({validateBeforeSave: false})

    return res
            .status(200)
            .json(new ApiResponse(200, video, "Toggle the value of isPublished successfully"))
})


export {
    getAllVideos, 
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}