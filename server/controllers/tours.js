const Tour = require("../model/tour")
const AppError = require("../utils/appError")
const asyncErrorHandler = require("../utils/asyncErrorHandler")
const factory = require("./factoryHandlers")

exports.getAllTours = asyncErrorHandler(async (req,res,next)=>{
  if(req.query.slug){
    const exp = req.query.slug
    req.query.slug = {$regex : new RegExp(exp),$options : 'i'}
    const data = await Tour.find(req.query)
    res.status(200).json({
      status : "success",
      data : data
    })
  }else{const queryObject = {...req.query}
    const excludedFields = ["page","sort","limit","fields"]
    excludedFields.forEach(el => delete queryObject[el]);
    let queryString = JSON.stringify(queryObject)
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match=> `$${match}`);
        
        let query = Tour.find(JSON.parse(queryString))
        if(req.query.sort){
            const sortBy = req.query.sort.split(",").join(" ")
            query = query.sort(sortBy)
        }else{
            query = query.sort("-createdAt");
        }
        if(req.query.fields){
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        }
        if(req.query.page && req.query.limit){
            query = query.skip((page-1)*limit).limit(limit)
        }
        const data = await query;
        res.status(200).json({
            status : "success",
            data : data
        })}
    
})


exports.getTourById = asyncErrorHandler(async (req,res,next)=>{
        const data = await Tour.findById(req.params.id).populate("reviews")
        if(!data){
            return next(new AppError("No Tour found with the provided ID",404))
        }
        res.status(200).json({
            status : "success",
            data : data
        })
})


exports.createTour = factory.createDoc(Tour)

exports.editTour = factory.updateDoc(Tour)

exports.deleteTour = factory.deleteOne(Tour)


exports.getToursWithin = asyncErrorHandler(async (req,res,next)=>{
    const{distance,latlng,unit} = req.params
    const [lat,lng] = latlng.split(",")
    const radius = unit === "mi" ? distance/3963.2 : distance/6378.1
    if(!lat || !lng){
        next(new AppError("Please provide Lattitude and Longitude in format lat,lng",400))
    }

    const data = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
      });

    res.status(200).json({
        status : "success",
        data : data
    })
})

exports.getDistances = asyncErrorHandler(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  });
  