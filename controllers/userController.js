import mongoose from "mongoose"
// Models
import User from "../models/User.js"
// Helpers
import createToken from "../helpers/createToken.js"
import createJWT from '../helpers/createJWT.js'
// Emails
import { sendEmail } from '../emails/index.js';

const ObjectId = mongoose.Types.ObjectId;

const authenticate = async (req, res) => {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if(!user) {
        const error = new Error('User does not exist')
        return res.status(404).json({ msg: error.message })
    }
    // Check if user is confiremd
    if(!user.confirmed) {
        const error = new Error('You must confirm your account')
        return res.status(400).json({ msg: error.message })
    }
    /* Check if user account is disabled */
    if(user.disabled) {
        const error = new Error('This account is disabled')
        return res.status(403).json({ msg: error.message })
    }

    const token = createJWT(user._id);
    if(await user.checkPassword(password)) {
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            city: user.city,
            address: user.address,
            postalCode: user.postalCode,
            phoneNumber: user.phoneNumber,
            token
        });
    } else {
        const error = new Error('Incorrect password')
        return res.status(403).json({ msg: error.message })
    }
}

const register = async (req, res) => {
    const { name, email, password } = req.body || {};

    if ([name, email, password].includes('') || [name, email, password].includes(undefined)) {
        return res.status(400).json({ msg: 'There are empty required fields' })
    }

    const emailExist = await User.findOne({ email })
    if (emailExist) {
        const error = new Error('There is already an account registered with this email')
        return res.status(400).json({ msg: error.message })
    }

    try {
        const user = new User(req.body)
        const token = createToken();
        user.token = token;
        sendEmail({
            options: {
                to: "asd@asd.com",
                subject: "Confirm your account"
            },
            content: `
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <p style="margin: 0">Thank you for creating an account on OnlineShop, click in the button below to confirm your account.</p>
                    <a href="${process.env.CLIENT_URL}/en/confirm/${token}" style="border: none; padding: .8rem 1.5rem; background: #BA9110; color: #fff; text-decoration: none; width: fit-content;">Confirm account</a>
                    <div>
                        <p style="margin: 0">If the button does not work use the following link:</p>
                        <a href="${process.env.CLIENT_URL}/en/confirm/${token}" style="color: #BA9110;">${process.env.CLIENT_URL}/en/confirm/${token}</a>
                    </div>
                </div>
            `
        });
        await user.save()
        res.status(200).json({ msg: 'Successfully registered user' })
    } catch (error) {
        console.log(error)
    }
}

const confirm = async (req, res) => {
    const { token } = req.params

    const user = await User.findOne({token})
    if(!user) {
        const error = new Error('Invalid token')
        return res.status(404).json({ msg: error.message })
    }

    try {
        user.confirmed = true
        user.token = ''
        await user.save()
        res.json({ msg: 'User confirmed successfully'})
    } catch (error) {
        console.log(error)
    }
}

const resetPassword = async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({ email })
    if(!user) {
        const error = new Error('There is no registered user with that email')
        return res.status(404).json({ msg: error.message })
    }

    try {
        const token = createToken();
        user.token = token;
        sendEmail({
            options: {
                to: "asd@asd.com",
                subject: "Reset password"
            },
            content: `
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <p style="margin: 0">You have requested to recover your password, click in the button below to reset your password.</p>
                    <a href="${process.env.CLIENT_URL}/en/new-password/${token}" style="border: none; padding: .8rem 1.5rem; background: #BA9110; color: #fff; text-decoration: none; width: fit-content;">Reset password</a>
                    <div>
                        <p style="margin: 0">If the button does not work use the following link:</p>
                        <a href="${process.env.CLIENT_URL}/en/new-password/${token}" style="color: #BA9110;">${process.env.CLIENT_URL}/en/new-password/${token}</a>
                    </div>
                </div>
            `
        });
        await user.save()
        return res.json({ msg: 'Instructions have been sent to your email', token: user.token });
    } catch (error) {
        console.log(error)
    }
}

const checkToken = async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({ token })
    if(!user) {
        const error = new Error('Invalid token')
        return res.status(404).json({ msg: error.message })
    }
    res.json({ msg: 'Valid token' })
}

const newPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    const user = await User.findOne({ token })
    if(!user) {
        const error = new Error('Invalid token')
        return res.status(404).json({ msg: error.message })
    }

    if (String(password).length < 8) {
        const error = new Error('The password is too short')
        return res.status(404).json({ msg: error.message })
    }

    user.password = password
    user.token = ''
    try {
        await user.save()
        res.json({ msg: 'You have changed the password successfully' })
    } catch (error) {
        console.log(error)
    }
}

const profile = async (req, res) => {
    const { user } = req

    res.json(user)
}

const editProfile = async (req, res) => {
    const { userId, name, surname, email, address, postalCode, city, phoneNumber, password } = req.body || {};

    if(!ObjectId.isValid(userId)) {
        const error = new Error("The userId is invalid");
        return res.status(400).json({ msg: error.message })
    }

    const user = await User.findById(userId)
    if(!user) {
        const error = new Error("This user does not exist");
        return res.status(400).json({ msg: error.message })
    }

    if(password && String(password).length < 8) {
        const error = new Error("Password must be 8 or more characters");
        return res.status(400).json({ msg: error.message })
    }

    /* if (String(name).length < 20 || String(surname).length < 20) {
        const error = new Error("First and last name must be less than 20 characters");
        return res.status(400).json({ msg: error.message })
    } */

    try {
        if (name) user.name = name;
        if (surname) user.surname = surname;
        if (email) user.email = email;
        if (address) user.address = address;
        if (postalCode) user.postalCode = postalCode;
        if (city) user.city = city;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (password) user.password = password;
        await user.save()
        return res.status(200).json({ msg: "You edited the profile correctly" })
    } catch (error) {
        return res.status(500).json({ msg: 'There was an error saving changes' })
    }
}

const disable = async (req, res) => {
    const { userId } = req.body

    if(ObjectId.isValid(userId)) {
        const user = await User.findOne({ userId })
        if(user) {
            console.log(user)
            user.disabled = true
            try {
                await user.save()
                res.json({ msg: 'You have successfully deactivated your account'})
            } catch (error) {
                console.log(error)
                res.json({ msg: 'There was a problem deactivating your account' })   
            }
        }
    }
}

export {
    authenticate,
    register,
    confirm,
    resetPassword,
    checkToken,
    newPassword,
    profile,
    editProfile,
    disable
}
