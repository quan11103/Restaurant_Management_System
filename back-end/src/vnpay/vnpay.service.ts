import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as qs from 'qs';

@Injectable()
export class VnpayService {
    private readonly tmnCode = process.env.VNPAY_TMN_CODE;
    private readonly secretKey = process.env.VNPAY_HASH_SECRET;
    private readonly vnpUrl = process.env.VNPAY_PAYMENT_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    private readonly returnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:5173/order-success2';

    createPaymentUrl(ipAddress: string, orderId: string, amount: number, orderInfo: string): string {
        const date = new Date();
        const createDate = this.formatDateToVnpay(date);

        // Khai báo các tham số theo chuẩn tài liệu 2.1.0 của VNPAY
        const vnpParams: Record<string, any> = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: this.tmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100, // VNPAY bắt buộc nhân 100 để quy đổi xu thành VNĐ
            vnp_ReturnUrl: this.returnUrl,
            vnp_IpAddr: ipAddress,
            vnp_CreateDate: createDate,
        };

        // Sắp xếp tham số theo alphabet và mã hóa ký tự đặc biệt
        const sortedParams = this.sortObject(vnpParams);

        // Tạo chuỗi query string để chuẩn bị băm (bắt buộc dùng { encode: false } do ta đã tự encode ở hàm sortObject)
        const signData = qs.stringify(sortedParams, { encode: false });

        // Băm bằng thuật toán HMAC-SHA512
        const hmac = crypto.createHmac('sha512', this.secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        // Gán mã Hash bảo mật vào object tham số
        sortedParams['vnp_SecureHash'] = signed;

        // Trả ra URL thanh toán hoàn chỉnh
        return `${this.vnpUrl}?${qs.stringify(sortedParams, { encode: false })}`;
    }

    // Hàm sắp xếp các key của Object theo Alphabet và Encode từng value chuẩn VNPAY
    private sortObject(obj: Record<string, any>): Record<string, any> {
        const sorted: Record<string, any> = {};
        const keys = Object.keys(obj).sort();

        for (const key of keys) {
            if (obj[key] !== null && obj[key] !== undefined && obj[key].toString().trim() !== '') {
                // Encode key và value, chuyển dấu cách thành '+' theo đúng chuẩn băm bảo mật của VNPAY
                const encodedKey = encodeURIComponent(key);
                const encodedValue = encodeURIComponent(obj[key].toString()).replace(/%20/g, '+');
                sorted[encodedKey] = encodedValue;
            }
        }
        return sorted;
    }

    // Định dạng thời gian theo chuẩn yyyyMMddHHmmss của GMT+7 (Việt Nam)
    private formatDateToVnpay(date: Date): string {
        // Đảm bảo đưa về múi giờ GMT+7 kể cả khi Server deploy ở nước ngoài (AWS, Heroku...)
        const utc = date.getTime() + date.getTimezoneOffset() * 60000;
        const vietnamTime = new Date(utc + 3600000 * 7);

        const pad = (num: number) => num.toString().padStart(2, '0');

        const year = vietnamTime.getFullYear();
        const month = pad(vietnamTime.getMonth() + 1);
        const day = pad(vietnamTime.getDate());
        const hours = pad(vietnamTime.getHours());
        const minutes = pad(vietnamTime.getMinutes());
        const seconds = pad(vietnamTime.getSeconds());

        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    // Kiểm tra tính hợp lệ của dữ liệu IPN từ VNPAY
    verifyIpn(query: Record<string, any>): boolean {
        const vnp_SecureHash = query['vnp_SecureHash'];

        // Clone object để không làm thay đổi object gốc, sau đó xóa các trường chữ ký đi để băm lại
        const vnp_Params = { ...query };
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // Sắp xếp lại theo chuẩn
        const sortedParams = this.sortObject(vnp_Params);
        const signData = qs.stringify(sortedParams, { encode: false });

        // Tạo lại mã băm từ dữ liệu nhận được
        const hmac = crypto.createHmac('sha512', this.secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        // So sánh mã băm tạo ra với mã băm VNPAY gửi sang
        return vnp_SecureHash === signed;
    }
}