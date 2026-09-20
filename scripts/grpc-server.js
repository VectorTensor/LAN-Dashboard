const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/downloads.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const downloadsProto = protoDescriptor.downloads;

const store = [
  {
    id: 'grpc-dl-101',
    filename: 'debian-12.5.0-amd64-netinst.iso',
    size: '628 MB',
    status: 'COMPLETED',
    progress: 100,
    url: 'https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-12.5.0-amd64-netinst.iso',
    created_at: new Date().toISOString(),
  },
  {
    id: 'grpc-dl-102',
    filename: 'redis-7.2.4-cluster-dump.rdb',
    size: '450 MB',
    status: 'IN_PROGRESS',
    progress: 82,
    url: 'http://cache.svc.local/redis/redis-7.2.4-cluster-dump.rdb',
    created_at: new Date().toISOString(),
  },
];

function getDownloads(call, callback) {
  console.log('[gRPC Server] Received GetDownloads request filter:', call.request.filter);
  callback(null, { items: store });
}

function createDownload(call, callback) {
  const { filename, url } = call.request;
  console.log('[gRPC Server] Received CreateDownload request:', filename, url);
  const newItem = {
    id: `grpc-dl-${Date.now()}`,
    filename: filename || 'unknown-download.bin',
    size: '320 MB',
    status: 'IN_PROGRESS',
    progress: 15,
    url: url || 'http://localhost/downloads/unknown.bin',
    created_at: new Date().toISOString(),
  };
  store.unshift(newItem);
  callback(null, newItem);
}

function main() {
  const server = new grpc.Server();
  server.addService(downloadsProto.DownloadService.service, {
    getDownloads: getDownloads,
    createDownload: createDownload,
  });

  const PORT = '0.0.0.0:50051';
  server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('[gRPC Server] Failed to bind:', err);
      return;
    }
    console.log(`[gRPC Server] DownloadService running on port ${port}`);
  });
}

main();
