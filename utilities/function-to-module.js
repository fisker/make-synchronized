const PREFIX = 'data:application/javascript;,export default '

function functionToModule(function_) {
  return new URL(
    `${PREFIX}${encodeURIComponent(String(function_))}`
  )
}

export default functionToModule