export const formatMessages = (exchanges: any) => {
    const formattedMessages = exchanges.map((exchange: any) => {
        const latestMessage = exchange[exchange.length - 1]
        const rfqMessage = exchange.find((message: any) => message.kind === 'rfq')
        const quoteMessage = exchange.find((message: any) => message.kind === 'quote')
        // console.log('quote', quoteMessage)
        // const status = generateExchangeStatusValues(latestMessage)
        const fee = quoteMessage?.data['payin']?.['fee']
        const payinAmount = quoteMessage?.data['payin']?.['amount']
        const payoutPaymentDetails = rfqMessage.privateData?.payout.paymentDetails
        return {
            id: latestMessage.metadata.exchangeId,
            payinAmount: (fee ? Number(payinAmount) + Number(fee) : Number(payinAmount)).toString() || rfqMessage.data['payinAmount'],
            payinCurrency: quoteMessage.data['payin']?.['currencyCode'] ?? null,
            payoutAmount: quoteMessage?.data['payout']?.['amount'] ?? null,
            payoutCurrency: quoteMessage.data['payout']?.['currencyCode'],
            // status,
            createdTime: rfqMessage.createdAt,
            ...latestMessage.kind === 'quote' && { expirationTime: quoteMessage.data['expiresAt'] ?? null },
            from: 'You',
            to: payoutPaymentDetails?.address || payoutPaymentDetails?.accountNumber + ', ' + payoutPaymentDetails?.bankName || payoutPaymentDetails?.phoneNumber + ', ' + payoutPaymentDetails?.networkProvider || 'Unknown',
            pfiDid: rfqMessage.metadata.to
        }
    })

    return formattedMessages;
}