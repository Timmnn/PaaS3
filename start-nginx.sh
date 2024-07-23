# Check if nginx is installed

if ! command -v nginx &> /dev/null
then
    echo "nginx could not be found"
    exit
fi

# Stop nginx if it is running
nginx -s stop;

# Start nginx
nginx -c $(pwd)/nginx.conf

nginx -s reload;