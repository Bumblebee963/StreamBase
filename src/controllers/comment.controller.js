import mongoose,{Schema} from "mongoose";
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const getVideoComments=asyncHandler(async(req,res)=>{
    const {videoID}=req.params;
    const { page = 1, limit = 10 } = req.query;

    const video=await Video.findById(videoID);

    if(!video){
        throw new ApiError(404,"Video not found");
    }

    const commentAggregate= Comment.aggregate([
        {
            $match :{
                video: new mongoose.Types.ObjectId(videoID)
            }
        },
        {
            $lookup:{
                from: "users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
            $lookup:{
                from: "likes",
                localField:"_id",
                foreignField:"comment",
                as:"likes"
            }
        },
        {
            $addFields:{
                likesCount :{
                    $size: "$likes"
                },
                owner:{
                    $first:"$owner"
                },
                isLiked:{
                   $cond:{
                    if:{$in:[req.user?._id,"likes.likedBy"]},
                    then:true,
                    else:false
                   }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project:{
                content:1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                },
                isLiked: 1

            }
        }
    ])

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const comments=await Comment.aggregatePaginate(
        commentAggregate,options
    );

    return res
    .status(200)
    .json(new ApiResponse(200,comments,"Comments fetched successfully"));
})

const addComment=asyncHandler(async(req,res)=>{
    const {videoID}=req.params;
    const {content}=req.body;

    const video=await Video.findById(videoID);
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    const comment=await Comment.create({
        content,
        video: videoID,
        owner:req.user?._id
    })

    if(!comment){
        throw new ApiError(500,"Failed to add comment")
    }
    return req
    .status(200)
    .json(new ApiResponse(201,comment,"Comment added successfully"));
})

const updateComment=asyncHandler(async(req,res)=>{
    const {commentID} =req.params;
    const {content}=req.body;

    const comment=await Comment.findById(commentID);

    if(!comment){
        throw new ApiError(404,"Comment not found")
    }

    if(comment?.owner.to_string()!==req.user?._id.to_string()){
        throw new ApiError(400, "only comment owner can edit their comment");
    }
    const updatedComment=await Comment.findByIdAndUpdate(
        comment?._id,
        {
            $set:{
                content
            }
        },
        {new:true}
    )
    if (!updatedComment) {
        throw new ApiError(500, "Failed to edit comment please try again");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment edited successfully")
        );
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only comment owner can delete their comment");
    }

    await Comment.findByIdAndDelete(commentId);

    await Like.deleteMany({
        comment: commentId,
        likedBy: req.user
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { commentId }, "Comment deleted successfully")
        );
});

export { getVideoComments, addComment, updateComment, deleteComment };