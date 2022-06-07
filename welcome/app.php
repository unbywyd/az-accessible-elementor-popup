<?php

define('AZ_WELCOME_DIR', plugin_dir_path(__FILE__));
define('AZ_WELCOME_URL', plugin_dir_url(__FILE__));


class AZ_WELCOME
{
    function __construct()
    {
        add_action('admin_init', [$this, 'admin_init']);
        add_action('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts']);
        add_action('plugins_loaded', [$this, 'plugins_loaded']);
        add_action('wp_ajax_az_welcome_popup_trigger', [$this, 'ajax_send_callback']);
    }
    public function ajax_send_callback()
    {
        check_ajax_referer('az-welcome-nonce', 'nonce_code');
        update_option('az_welcome_popup_shown', true);
    }
    public function plugins_loaded()
    {
        $path = dirname(plugin_basename(__FILE__)) . '/languages';
        load_plugin_textdomain('az-welcome', false, $path);
    }
    public function admin_init()
    {
        wp_register_script('az-welcome-popup', AZ_WELCOME_URL . 'assets/app/dist/index.min.js', array('jquery'), filemtime(AZ_WELCOME_DIR . 'assets/app/dist/index.min.js'), true);
        wp_localize_script('az-welcome-popup', 'az_welcome', array(
            'show' => !empty(get_option('az_welcome_popup_shown')) ? false : true,
            'url' => AZ_WELCOME_URL,
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('az-welcome-nonce'),
            't' => [
                'close' => __('Close', 'az-welcome'),
                'hero' => __('<u>Only together</u> we can make web content <br /> more <b>accessible</b> to everyone!', 'az-welcome'),
                'h2' => __('Just a couple of steps and you <u>will contribute to web accessibility!</u>', 'az-welcome'),
                'thank_you' => __('Thank you!', 'az-welcome'),
                'thank_you_sub' => __('Thank you for making the Internet accessible to everyone!', 'az-welcome'),
                'contact_us' => __('Do you have accessibility issues or questions? We can help you! The <a target="_blank" href="https://accessibility.zone/"><b>Accessibility Zone</b></a> team is always <u>ready to help you</u> with web accessibility, just <a href="https://accessibility.zone/contact-us">contact us!</a>', 'az-welcome'),
                'contact_us_btn' => __('Contact Us', 'az-welcome'),
                'callback' => __('Callback', 'az-welcome'),
                'callback_message' => __('Would you like to get in touch with us and receive news from us?', 'az-welcome'),
                'your_email' => __('Your email', 'az-welcome'),
                'your_email2' => __('Your e-mail', 'az-welcome'),
                'tellus' => __('Tell us which wordpress plugins need web accessibility', 'az-welcome'),
                'about_plugins' => __('About inaccessible plugins', 'az-welcome'),
                'textarea_plr' => __("The plugin I'm using and it's not accessible", 'az-welcome'),
                'qst' => __('Are you a developer?', 'az-welcome'),
                'yes' => __('Yes', 'az-welcome'),
                'no' => __('No', 'az-welcome'),
                'to_back' => __('To back', 'az-welcome'),
                'close_popup' => __("I'm not interested in anything, close this popup!", 'az-welcome'),
                'send' => __('Send', 'az-welcome'),
                'skip' => __('Skip', 'az-welcome'),
                'next' => __('Next ➝', 'az-welcome'),
                'skip_and_finish' => __('Skip and finish', 'az-welcome')
            ]
        ));
    }

    public function admin_enqueue_scripts()
    {
        wp_enqueue_script('az-welcome-popup');
    }

    public static function plugin_activated()
    {
        delete_option('az_welcome_popup_shown');
    }

    public static function init($plugin)
    {
        register_activation_hook($plugin, ['AZ_WELCOME', 'plugin_activated']);
        register_deactivation_hook($plugin, ['AZ_WELCOME', 'plugin_activated']);
    }
}

$AZ_WELCOME =  new AZ_WELCOME();
