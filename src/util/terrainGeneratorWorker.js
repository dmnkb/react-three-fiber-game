addEventListener("message", evt => {
  const workerResult = evt.data[0];
  postMessage(workerResult, '*');
});