#!/usr/bin/env bash 
echo "Deployment starting..."

echo "Change Directory"
cd /var/apps/ || exit

if [ -d "techaidiq-annotation-build" ]; then
  echo "remove previous build folder"
  rm -rf techaidiq-annotation-build
fi

echo "Git Clone"
git clone https://github.com/autotechiq-com/techaidiq techaidiq-annotation-build || exit


cd /var/apps/techaidiq-annotation-build || exit

git switch master || exit

git pull || exit

echo "Switch build to deploy"
cp /var/apps/techaidiq-annotation/.env /var/apps/techaidiq-annotation-build/.env || exit
cp /var/apps/techaidiq-annotation/ecosystem.config.js /var/apps/techaidiq-annotation-build/ecosystem.config.js || exit


echo "npm install"
npm i --legacy-peer-deps || exit

echo "Start build to temp"

npm run build || exit

if [ ! -d ".next" ]; then
  echo '\033[31m dist Directory not exists!\033[0m'  
  exit 1;
fi

cd /var/apps || exit

pm2 stop taiq-annotation

echo "delete old files"
rm -rf /var/apps/techaidiq-annotation-old

echo "Switch build to deploy"
mv /var/apps/techaidiq-annotation /var/apps/techaidiq-annotation-old || exit
mv /var/apps/techaidiq-annotation-build /var/apps/techaidiq-annotation || exit

cd /var/apps/techaidiq-annotation || exit
pm2 startOrGracefulReload ecosystem.config.js --node-args="--max-old-space-size=8192" || exit

echo "Deployment done."