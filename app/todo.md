// add it so that you can choose if VM should be premium, hidden or free
// add the VM section
~~// fix linkvertise abuse thing by checking headers~~
~~// fix the egg system to add nest id~~
~~//fix deploy o it sends egg id~~
fix location editing
fix plan editing


sudo bash -c 'echo -e "opcache.enable=1\nopcache.jit_buffer_size=256M\nopcache.jit=1255" >> /etc/php/8.3/fpm/php.ini && systemctl restart php8.3-fpm'






1







/*************************************************
 * The below are configuration to dev mode in 
 * WSL. Use php.8, (php artisan serve). Using 
 * Octane is stupid with franken php
 *
 *///////////////////////////////////////////////


############################################
/*****************************
 sudo service mariadb start 
/*****************************
For mariadb 
###########################################


adding async to the Update resource jOB to make it fast. 
Making everything use ASYNC to be faster



# Kushi-Dash Queue Worker File
# ----------------------------------

[Unit]
Description=universal Queue Worker
After=redis-server.service

[Service]
# On some systems the user and group might be different.
# Some systems use `apache` or `nginx` as the user and group.
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/Kushi-Dash/artisan queue:work --queue=high,standard,low --sleep=3 --tries=3
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=multi-user.target