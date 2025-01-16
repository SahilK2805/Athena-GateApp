const getError = (error) => {
if (error.response) {
    console.log('Error:', error.response,"Recived Response");
    console.log('Error:', error.response.data.message,"Recived Response");
    throw new Error(error.response.data.message);
}
else{
    console.log('Error:', error.message,"No Response");
    throw new Error(error.message);
}
// return(
    //Maybe
// )
}
export default getError;