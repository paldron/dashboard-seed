import axios from "axios";
import moment from "moment";

axios.defaults.headers.common["Cache-Control"] =
  "no-cache, no-store, max-age=0";

export function setTokenHeader(token) {
  if (token) {
    localStorage.setItem("jwtToken", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("jwtToken");
  }
}

export function apiFetch(method, path, data) {
  return new Promise((resolve, reject) => {
    return axios[method.toLowerCase()](path, data)
      .then((res) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data.error);
      });
  });
}

export function formPost(method, path, data) {
  return new Promise((resolve, reject) => {
    return axios[method.toLowerCase()](path, data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data.error);
      });
  });
}

export function s2ab(s) {
  let buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
  let view = new Uint8Array(buf); //create uint8array as viewer
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
  return buf;
}

export function getRefDate() {
  const refDate = moment()
    .set("month", 12 - 1)
    .set("year", 2020);
  return refDate;
}

export function getFormData(formData, data, previousKey) {
  if (data instanceof Object) {
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (
        value instanceof Object &&
        !Array.isArray(value) &&
        key !== "picture"
      ) {
        return getFormData(formData, value, key);
      }
      if (previousKey) {
        key = `${previousKey}[${key}]`;
      }
      if (Array.isArray(value)) {
        value.forEach((val, index) => {
          if (val instanceof Object) {
            getFormData(formData, val, `${key}[${index}]`);
          } else {
            formData.append(`${key}[]`, val);
          }
        });
      } else {
        formData.append(key, value);
      }
    });
  }
}
