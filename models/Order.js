import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    products: [{
        id: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        price: {
            type: String
        },
        description: {
            type: String
        },
        img: {
            type: String
        },
        category: {
            type: String
        },
        count: {
            type: Number
        }
    }],
    shipping: {
        name: {
            type: String,
            required: true
        },
        surname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        }
    },
    total: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        enum: ['USD', 'EUR']
    },
    payments: {
        captures: [Object]
    },
    discountCode: {
        type: String
    },
    status: {
        type: String,
        enum: ['COMPLETED', 'PARTIALLY_REFUNDED', 'PENDING', 'FAILED', 'VOIDED', 'IN_PROGRESS'],
        required: true
    }
}, {
    timestamps: true
})

const Order = mongoose.model('Order', orderSchema)

export default Order