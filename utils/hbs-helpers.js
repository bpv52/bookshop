module.exports = {
    if_eq(a, b, options){
        // console.log(typeof a, typeof b);
        // console.log(a, b);
      if(a == b) return options.fn(this);
      return options.inverse(this);
    }
  }