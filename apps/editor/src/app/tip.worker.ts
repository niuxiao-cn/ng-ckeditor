/// <reference lib="webworker" />
import * as mock from "mockjs"

addEventListener('message', ({ data }) => {
    const _data = data ? mock.mock({"list|1-20": [data + "@paragraph"]}) : {list: []};
    postMessage(_data);
});
