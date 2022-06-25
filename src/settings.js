var config = {};

config.db = {
	host: "DummyHost",
	user: "DummyAdmin",
	password: "DummyPassword",
	database: "DummyEvents"
}

config.http = {
	port: 8080, //remote port
	auth: {
		username: "DummyUser",
		password: "DummyPassword"
	}
}

module.exports = config;
