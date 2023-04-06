const queue = [] as any
let isFlushing = false

export function nextTick(
  fn
) {
  const p = Promise.resolve()
  return fn ? p.then(fn) : p
}

export function queueJobs(
  fn
) {
  if (!queue.includes(fn)) {
    queue.push(fn)
    queueFlash()
  }
}

function queueFlash() {
  if (isFlushing) return
  isFlushing = true
  nextTick(flushJobs)
}

function flushJobs() {
  let job
  while((job = queue.shift())) {
    job()
  }
  queue.length = 0
  isFlushing = false
}