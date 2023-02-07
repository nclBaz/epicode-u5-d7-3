import mongoose from "mongoose"
import bcrypt from "bcrypt"

const { Schema, model } = mongoose

const UsersSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
)

UsersSchema.pre("save", async function (next) {
  // BEFORE saving the user in db, executes this custom function automagically
  // Here I am not using arrow functions as I normally do because of "this" keyword
  // (it would be undefined in case of arrow function, it is the current user in the case of a normal function)

  const currentUser = this

  if (currentUser.isModified("password")) {
    // only if the user is modifying the pw (or if the user is being created) I would like to spend some precious CPU cycles on hashing the pw
    const plainPW = currentUser.password

    const hash = await bcrypt.hash(plainPW, 11)
    currentUser.password = hash
  }
  // When we are done with this function --> next
  next()
})

UsersSchema.methods.toJSON = function () {
  // This .toJSON method is used EVERY TIME Express does a res.send(user/s)
  // This does mean that we could override the default behaviour of this method to remove the passwords (and other unnecessary things as well) and then return the users

  const userDocument = this
  const user = userDocument.toObject()

  delete user.password
  delete user.createdAt
  delete user.updatedAt
  delete user.__v
  return user
}

export default model("User", UsersSchema)
