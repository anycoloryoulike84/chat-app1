
var highfive = function() {
  console.log("smack!!");
};



var warn = function(message) {
  console.log("Warning: " + message);
};

var info = function(message) {
  console.log("Info: " + message);
};

var error = function(message) {

  console.log("Running on Port: " + message);
};

var underscoreFx = function() {
	var scores = [84, 99, 91, 65, 87, 55, 72, 68, 95, 42], 
	topScorers = [], scoreLimit = 90;
 
for (i=0; i<=scores.length; i++)
{
    if (scores[i]>scoreLimit)
    {
        topScorers.push(scores[i]);
    }
}
	topScorers.sort();
	console.log(topScorers);

};



module.exports = highfive;
module.exports.info = info;
module.exports.warn = warn;
module.exports.error = error;
module.exports.underscoreFx = underscoreFx;