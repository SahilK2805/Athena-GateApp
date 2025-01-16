const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const {User,Gate,Shared} = require('../config/exporting');
const { where } = require('sequelize');

const newGate = catchAsync(async (req, res, next) => {
    const body = req.body;    
    const userid = req.user.id;
    // const adminid = req.body.id;
    console.log(userid);
    const newGate = await Gate.create({
        name:body.name,
        subscription: body.subscription,
        status: body.status,
        locked: false,
        LocationLat: 0,
        LocationLon: 0,
    }).catch((error) => {
        console.log(error);
        });

    const SharedGate = await Shared.create({
        userId: userid,
        gateId: newGate.id,
        adminid: userid,
    });

    if (newGate === null || SharedGate === null) {
        return next(new AppError('Failed to create the gate', 400));
    }
    const result = newGate.toJSON();
    const sharedResult = SharedGate.toJSON();
    return res.status(201).json({
        status: 'success',
        data: result+sharedResult,
    });
});

const ShareGate = catchAsync(async (req, res, next) => {
    const adminid = req.user.id;
    const userid = req.body.id;
    const gateid = req.params.id;
    console.log(userid, adminid, gateid);

    const SharedGate = await Shared.create({
        userId: userid,
        gateId: gateid,
        adminid: adminid,
    });
    if (SharedGate === null) {
        return next(new AppError('Failed to create the gate', 400));
    }
    const shareResult = SharedGate.toJSON();
    return res.status(201).json({
        status: 'success',
        data: shareResult,
    });
});

const getAllgates = catchAsync(async (req, res, next) => {
    const result = await Gate.findAll();
    return res.json({
        status: 'success',
        data: result,
    });
});

const getUsergates = catchAsync(async (req, res, next) => {
    const userid = req.params.id;
    const result = await User.findByPk(userid, { include: [{ model: Gate, through:{attributes:[]} }] });
    return res.json({
        status: 'success',
        data: result["Gates"],
    });
});

const deleteGate = catchAsync(async (req,res,next) =>{
    console.log();
    let userid;
    if (req.body.id){
       userid = req.body.id;
    }
    else{
        userid = req.user.id;
    }
    const gateid = req.params.id;
    console.log("At Delete",userid, gateid);
    const result = await Shared.findOne( { where : { gateId : gateid, userId: userid } } );
    if (!result) {
        console.log('gate not found');
        return next(new AppError('Failed to update the gate', 400));
    }
    try{
        console.log('Deleting gate');
        await Shared.destroy({where: {gateId: gateid, userId: userid}});
    }catch(error){
        return next(new AppError('Failed to delete the gate', 400));
    }
    return res.status(200).json({
        status: 'success',
        data: null
    });
})

const getAdmingates = catchAsync(async (req, res, next) => {
    const userid = req.params.id;
   const result = await User.findAll({
        include: [
            { 
                model: Gate,
                attributes: ['id','name', 'subscription'],
                through:{
                    where: { adminid : userid }
                }
            }
        ],
        attributes: ['id', 'name','email']
      });

    return res.json({
        status: 'success',
        data: result,
    });
});


const setLocation = catchAsync(async (req, res, next) => {
    const body = req.body;
    const gateid = req.params.id;
    const result = await Gate.findByPk(gateid);
    if (!result) {
        console.log('gate not found');
        return next(new AppError('Failed to update the gate', 400));
    }
    
    result.locationLat = body.LocationLat;
    result.locationLon = body.LocationLon;
    result.updatedAt = new Date();
    
    await result.save();
    return res.json({
        status: 'success',
        message: 'Location updated',
    });

});
const setLock = catchAsync(async (req, res, next) => {
    const body = req.body;
    const userid = req.user.id;
    const gateid = req.params.id;
    console.log(userid, gateid);
    const result = await Gate.findByPk(gateid);
    if (!result) {
        console.log('gate not found');
        return next(new AppError('Failed to update the gate', 400));
    }
    result.locked = body.locked;
    result.updatedAt = new Date();

    await result.save();
    return res.json({
        status: 'success',
    });
});

const setgeoLock = catchAsync(async (req, res, next) => {
    const body = req.body;
    const gateid = req.params.id;
    const result = await Gate.findByPk(gateid);
    if (!result) {
        console.log('gate not found');
        return next(new AppError('Failed to update the gate', 400));
    }
    console.log(body.geolocked);
    result.geolocked = body.geolocked;
    result.updatedAt = new Date();

    await result.save();
    return res.json({
        status: 'success',
    });
});

// const getLocation = catchAsync(async (req, res, next) => {
//     const gateid = req.params.id;
//     const result = await Gate.findByPk(gateid);
//     if (!result) {
//         console.log('gate not found');
//         return next(new AppError('Failed to update the gate', 400));
//     }

//     return res.json({
//         status: 'success',
//         data: {
//             gateLat: result.gateLat,
//             gateLon: result.gateLon,
//         },
//     });
// });
const getLock = catchAsync(async (req, res, next) => {
    const gateid = req.params.id;
    const result = await Gate.findByPk(gateid);
    if (!result) {
        console.log('gate not found');
        return next(new AppError('Failed to find the gate', 400));
    }

    return res.json({
        status: 'success',
        data: {
            locked: result.locked,
        },
    });
});
const gateStatus = catchAsync(async (req, res, next) => {
    const body = req.body;
    const gateid = req.params.id;
    console.log("at gateStatus",gateid,body);
    const result = await Gate.findByPk(gateid);
    if (!result) {
        console.log('gate not found');
        return next(new AppError('Failed to update the gate', 400));
    }
    console.log(body.status,result)
    result.status = body.status;
    result.updatedAt = new Date();

    await result.save();
    return res.json({
        status: 'success',
    });
});

module.exports = { newGate, ShareGate , getAllgates, getUsergates, gateStatus , getAdmingates, deleteGate, setLocation, setgeoLock, setLock, getLock };