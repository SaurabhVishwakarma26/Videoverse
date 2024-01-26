import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  /*
  1. get user details from frontend
  2. validation - not empty
  3. check if user already exists: username , email
  4. check for images, check for avatar
  5. upload them to cloudinary, avatar
  6. create user object - create entry in db
  7. remove password and refresh token field from response
  8. check for user creation
  9. return response
  */

  //1. get user details from frontend
  const { fullName, email, username, password } = req.body;

  //2. validation - not empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!!!");
  }

  //3. check if user already exists: username , email
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    return new ApiError(409, "User with email or username already exists");
  }

  //4. check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required.");
  }

  //5. upload them to cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required.");
  }

  //6. create user object - create entry in db
  //7. remove password and refresh token field from response
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //8. check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong when creating user.");
  }

  //9. return response
  return res
    .status(201)
    .json(new ApiError(201, createdUser, "User registered successfully"));
});

export { registerUser };
