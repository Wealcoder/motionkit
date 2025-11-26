<!DOCTYPE html>
<html>
<head>
    <title><?php echo esc_html__('Animation Builder','gsap-animation-builder-for-wordpress') ?></title>
    <?php wp_head(); ?>
</head>
<body <?php \WcfAnimationBuilder\Helpers\Helper::builder_body_class(); ?>>   
    <div class="wcf-ab-editor-container">
        <div id="wcf--animation-builder--editor"></div>
    </div>  
    <div id="wcf--animation-builder--toast"></div>     
    <?php wp_footer(); ?>
</body>
</html>
