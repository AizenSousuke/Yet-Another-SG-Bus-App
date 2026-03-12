#!/bin/bash
mongosh <<EOF
try {
  rs.initiate({
    _id: "replicaSet",
    members: [{ _id: 0, host: "mongodb:27017" }]
  })
} catch (e) {
  print("Replica set may already be initiated: " + e);
}
EOF
