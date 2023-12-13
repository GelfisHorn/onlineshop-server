import axios from "axios";
// 
import mongoose from "mongoose"
// Models
import Order from "../models/Order.js"
// Helpers
import useCurrencyFormatter from '../helpers/useCurrencyFormatter.js';
// Emails
import { sendEmail } from "../emails/index.js";

const getOrders = async (req, res) => {
    const { email } = req.user;

    try {
        const orders = await Order.find({ 'shipping.email': email });
        return res.status(200).json({ success: true, data: orders });
    } catch (err) {
        const error = new Error('There was an error gettings orders');
        return res.status(404).json({ msg: error.message });
    }
}

const create = async (req, res) => {
    try {
        const order = new Order({ ...req.body });
        if (!order.products || (typeof order.products == 'object' && order.products.length == 0)) {
            const error = new Error('Products missing');
            return res.status(404).json({ msg: error.message });
        }
        const status = {
            COMPLETED: "Completed",
            PARTIALLY_REFUNDED: "Partially refunded",
            PENDING: "Pending",
            FAILED: "Failed",
            VOIDED: "Voided",
            IN_PROGRESS: "In progress"
        }
        sendEmail({
            options: {
                to: order?.shipping?.email,
                subject: "Thank you for your order"
            },
            content: `
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <h2>Thank you for your order! Here is a summary of your order:</h2>
                    <div style="display: flex; flex-direction: column; font-size: 19px;">
                        <div style="display: flex; flex-direction: row; gap: 3px;">
                            <span style="font-weight: 500">Order ID:</span>
                            <span>${order?._id}</span>
                        </div>
                        <div style="display: flex; flex-direction: row; gap: 3px;">
                            <span style="font-weight: 500">Payment status:</span>
                            <span>${status[order?.status]}</span>
                        </div>
                        <div style="display: flex; flex-direction: row; gap: 3px;">
                            <span style="font-weight: 500">Total:</span>
                            <span>${useCurrencyFormatter(order?.currency).format(order?.total)}</span>
                        </div>
                    </div>
                    <div>
                        <h3>Products:</h3>
                        <div style="display: flex; flex-direction: column;">
                            ${order.products.map(p => (`
                                <div style="padding: .4rem 0; border-bottom: 1px solid rgb(230, 230, 230)">
                                    <div style="display: flex; flex-direction: row; gap: 3px;">
                                        <span style="font-weight: 500">Name:</span>
                                        <span>${p?.name}</span>
                                    </div>
                                    <div style="display: flex; flex-direction: row; gap: 3px;">
                                        <span style="font-weight: 500">Price:</span>
                                        <span>${useCurrencyFormatter(order?.currency).format(p?.price)} (x${p?.count})</span>
                                    </div>
                                </div>
                            `)).join('')}
                        </div>
                    </div>
                </div>
            `
        });

        order.products.map(p => {
            axios.request({
                method: "PUT",
                url: `${process.env.STRAPI_URI}/products/update-stock/${p.id}`,
                headers: {
                    "Content-Type": "application-json",
                    'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
                }
            });
        })
        axios.request({
            method: "PUT",
            url: `${process.env.STRAPI_URI}/discount-codes/update-uses`,
            headers: {
                "Content-Type": "application-json",
                'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
            },
            data: { codigo: order.discountCode }
        });
        
        await order.save();
        return res.status(200).json({ success: true })
    } catch (err) {
        const error = new Error('There was an error creating order');
        return res.status(404).json({ msg: error.message });
    }
}

const success = async (req, res) => {
    try {
        const { id } = req.params || {};
        const order = await Order.findById(id);
        if (!order) {
            const error = new Error("This order doesn't exists");
            return res.status(404).json({ msg: error.message });
        }
        order.status = 'success';
        await order.save();
        return res.status(200).json({ success: true });
    } catch (err) {
        const error = new Error('There was an error changing order status');
        return res.status(404).json({ msg: error.message });
    }
}

const cancel = async (req, res) => {
    try {
        const { id } = req.params || {};
        const order = await Order.findById(id);
        if(!order) {
            const error = new Error("This order doesn't exists");
            return res.status(404).json({ msg: error.message });
        }
        order.status = 'cancelled';
        await order.save();
        return res.status(200).json({ success: true });
    } catch (err) {
        const error = new Error('There was an error cancelling order');
        return res.status(404).json({ msg: error.message });
    }
}

export {
    getOrders,
    create,
    success,
    cancel
}