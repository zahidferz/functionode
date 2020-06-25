if (!process.env.NODE_ENV) {
  require("dotenv").config();
}
const axios = require("axios");
const nr = require("newrelic");

module.exports = async function(context, mySbMsg) {
  context.log(
    "JavaScript ServiceBus queue trigger function processed message",
    mySbMsg
  );
  context.log("EnqueuedTimeUtc", context.bindingData.enqueuedTimeUtc);
  context.log("DeliveryCount", context.bindingData.deliveryCount);
  context.log("MessageId", context.bindingData.messageId);
  context.log("GX_BOA_MS_PRECALCULATED_URL", process.env["GX_BOA_MS_PRECALCULATED_URL"]);
  let request = axios.create({
    baseURL: process.env["GX_BOA_MS_PRECALCULATED_URL"],
    timeout: 30000,
    headers: {
      "Content-Type": "application/json"
    }
  });
  try {
    let response = await nr.startSegment(
      "post /precalculated/sales",
      true,
      async () => {
        return await request.post(`/precalculated/sales`, mySbMsg);
      }
    );
    context.log("SalesServiceBusQueueTrigger.response", response.data);
  } catch (error) {
    context.log("SalesServiceBusQueueTrigger.error", error);
  }
  context.done();
};
