//Generates a random alphanumeric including upper and lower cases
exports.generateRandStr = function() {
  const max = 109;
  const min = 48;
  const offset1 = 7;  // number of unicode characters from : to @ inclusive
  const offset2 = 6; // number of unicode characters from [ to ` inclusive
  let randNum;
  let randString = '';

  for (let i = 0; i < 6; i++) {
    // generate a random number from 48 to 100 (ie starting at unicode character 0)
    randNum = Math.floor(Math.random() * (max - min + 1) + min);
    if (randNum > 57 && randNum < 84) {
      randNum += offset1;
    } else if (randNum >= 84){
      randNum += offset1 + offset2;
    }
    randString += String.fromCharCode(randNum);
  }
  return randString;
}

// Gets the current date and returns a string in dd-mm--dddd format
exports.getDate = function() {
  const date = new Date();
  console.log(date.getTimezoneOffset());
  return (`${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`).toString();
}