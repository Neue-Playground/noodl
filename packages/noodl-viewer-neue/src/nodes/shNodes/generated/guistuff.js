let dynamicports = []
let enabled = "(enX | enY | enZ) == True and mode > 0"
enabled = enabled.replaceAll('(', '')
enabled = enabled.replaceAll(')', '')
let tokens = enabled.split(' ')
let nonVars = ['==', '<', '<=', '>', '>=', '!=']
let vars = []
let op = ''
let val = ''
let condition = ''
for (let i = 0; i < tokens.length; i++){
  let token = tokens[i]
  if (token === 'and') {
    condition += ' AND '
  } else if (token === 'or') {
    condition += ' OR '
  } else if (token === '|')
      continue
  else if (!nonVars.includes(token))
    vars.push(token)
  else {
    op = token !== '==' ? token : '='
    val = tokens[++i]
    for (let j = 0; j < vars.length; j++) {
      let variable = vars[j]
      condition += `${variable} ${op} ${val}`
      if (j !== vars.length - 1) condition += ' OR '
      else vars = []
    }
  }
}
dynamicports.push({
  name: 'conditionalports/extended',
  condition,
  inputs: ['test']
})
console.log(dynamicports)