const ipCapture = (req, res, next) => {
  // ดักจับ IP จาก headers ต่างๆ
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             'unknown';
  
  req.clientIp = ip.replace('::ffff:', ''); // ลบ IPv6 prefix
  next();
};

module.exports = ipCapture;