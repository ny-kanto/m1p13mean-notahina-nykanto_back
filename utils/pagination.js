export const pagination = async (model, filter, req) =>{
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        model.find(filter).skip(skip).limit(limit),
        model.countDocuments(filter)
    ]);

    return {
        page,
        limit,
        skip,
        data,
        totalPages : Math.ceil(total / limit),
        totalItems : total
    }
}
