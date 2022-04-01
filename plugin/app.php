<?php

/**
 * Accessible Elementor popups by Accessibility Zone
 *
 * @copyright Copyright (C) 2021 to this day, Webto.pro - support@webto.pro
 *
 * @wordpress-plugin
 * Plugin Name: Accessible Elementor popups by Accessibility Zone
 * Version:     1.0.0
 * Description: Adds accessibility support to elementor popups
 * Author:      Unbywyd
 * Plugin URI:  https://accessibility.zone
 * Author URI:  https://unbywyd.com
 * Text Domain: az-accessible-elementor-popup
 */

define('AZ_AELP_DIR', plugin_dir_path(__FILE__));
define('AZ_AELP_URL', plugin_dir_url(__FILE__));

define('AZ_AELP_DEV_MODE', true);

class AZ_ACCESSIBLE_ELEMENTOR_POPUPS
{
    function __construct()
    {
        add_action('init', [$this, 'init']);
        add_action('wp_enqueue_scripts', [$this, 'wp_enqueue_scripts']);
        add_action('plugins_loaded', [$this, 'plugins_loaded']);
    }
    public function plugins_loaded()
    {            
        $path = dirname( plugin_basename(__FILE__)) . '/languages';
        load_plugin_textdomain( dirname( plugin_basename(__FILE__)), false, $path );

    }
    public function init()
    {

        wp_register_script('az-accessible-elementor-popups', AZ_AELP_URL . 'assets/app/dist/index.min.js', array('jquery'), filemtime(AZ_AELP_DIR . 'assets/app/dist/index.min.js'), true);
        wp_localize_script('az-accessible-elementor-popups', 'az_i18n', array(
            'close' => __('Close', 'az-accessible-elementor-popup')
        ));
    }

    public function wp_enqueue_scripts()
    {
        wp_enqueue_script('az-accessible-elementor-popups');
    }
}

$AZ_ACCESSIBLE_ELEMENTOR_POPUPS =  new AZ_ACCESSIBLE_ELEMENTOR_POPUPS();
