import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const createPlaylist = asyncHandler(async(req, res) => {
    const {name, description} = req.body

    if(!name || !description){
        throw new ApiError(404, "Name and description are required")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid User")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: user._id
    })

    if(!playlist){
        throw new ApiError(500, "Error in creating playlist")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Successfully created playlist"))

})

const getUserPlaylists = asyncHandler(async(req, res) => {
    const { userId } = req.params

    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(404, "Invalid Object Id");
    }

    const playlist = await Playlist.findOne(
        {
            owner: userId
        }
    )

    if(!playlist){
        throw new ApiError(400, "Invalid userId")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Successfully fetched user playlist"))
})

const getPlaylistById = asyncHandler(async(req, res) => {
    const { playlistId } = req.params

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(404, "Invalid Object Id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid User")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "Invalid playlist id")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Successfully fetched playlist"))
})

const addVideoToPlaylist = asyncHandler(async(req, res) => {
    const {playlistId, videoId} = req.params

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(404, "Invaild object id")
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(404, "Invalid video object id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid user")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, 
        {
            $push: {video: videoId}
        },
        {
            new: true
        }
    )
    
    if(!playlist){
        throw new ApiError(400, "Invalid playlist Id")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Successfully added video to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async(req, res) => {
    const { playlistId, videoId } = req.params;

    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(404, "Invalid Object Id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid User")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull: {video: videoId}
        },
        {new: true}
    )

    if(!playlist){
        throw new ApiError(400, "Invalid playlist id")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Successfuully rermoved video from playlist"))
})

const deletePlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.params

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(404, "Invalid Object id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid User")
    }

    const playlist = await Playlist.findByIdAndDelete((playlistId))

    if(!playlist){
        throw new ApiError(400, "Invalid playlist Id")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Successfully deleted playlist"))

})

const updatePlaylist = asyncHandler(async(req, res) => {
    const { playlistId } = req.params
    const {name, description } = req.body

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(404, "Invalid Object Id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid User")
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Invalid playlist Id")
    }

    if(name){
        playlist.name = name
    }

    if(description){
        playlist.description = description
    }

    await playlist.save()

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Successfully updated playlist"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    addVideoToPlaylist
}