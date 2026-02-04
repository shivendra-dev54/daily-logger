

class ApiResponse<T> {
	statusCode: number
	message: string
	status: boolean
	data: T

	constructor(
		statusCode = 200,
		message = "successfully fetched endpoint",
		status = true,
		data: T
	) {
		this.statusCode = statusCode;
		this.message = message;
		this.status = status;
		this.data = data;
	}

	toString() {
		return {
			"statusCode": this.statusCode,
			"message": this.message,
			"data": this.data,
			"status": this.status
		};
	}
};

export {
	ApiResponse
};