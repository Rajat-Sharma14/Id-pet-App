
  const pagination =   function paginatedResult(model){
        return(req,res,next)=>{
            const page = parseInt(req.query.page)
            const limit = 5

            const startIndex = (page-1)*limit
            const endIndex = (page*limit)

            const resultUsers = User.slice(startIndex,endIndex)
        }

    }
