import { Model } from 'sequelize';

class ExtendedModel extends Model {
	static async paginate(options) {
		let { limit = 10, offset = 0 } = options;
		
		const result = await this.findAndCountAll({ distinct: true, ...options });
		
		let dataFieldName = ~this.getTableName().indexOf(`_`)
			? this.getTableName()
				.split('_')
				.map(e => _.capitalize(e))
				.join('')
			: _.capitalize(this.getTableName());
		
		return {
			[dataFieldName]: result.rows,
			Pagination: {
				total: result.count,
				totalPages: Math.ceil(result.count / limit),
				currentPage: Math.ceil((offset + limit) / limit),
				nextPageExists: !(result.count < offset + limit),
				previousPageExists: offset > 0
			}
		};
	}
}

export default ExtendedModel;