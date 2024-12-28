import CustomPromise from "./promise";

console.log('1')

new CustomPromise<string>((res,rej)=>{
        res("2")
}).then((data)=>{
      console.log(data);
      return "passing in the chain"
}).then((data)=>{
    console.log(data);
    return "scd time passing in chain"
}).then((data)=>{
     console.log(data)
})

console.log('3')