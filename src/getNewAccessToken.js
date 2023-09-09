const secret = "yzbwa0pxgolivdfzvhgthsp5scosje";
const clientId = "5f40c5goeja3illv2458wbvq2e9kbf";

const getAccessToken = async () => {
  const res = fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `client_id=${clientId}&client_secret=${secret}&grant_type=client_credentials`,
  });
  const json = await (await res).json();
  return json;
};

getAccessToken().then((thing) => {
  console.log(thing);
});
