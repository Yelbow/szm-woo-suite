<?php
/**
 * SZM Woo Suite - module Klik-om-te-kopieren op het orderscherm.
 *
 * Loaded by szm-woo-suite.php (only after its load-once guard). On the
 * WooCommerce order edit screen (HPOS and classic post.php) a click on the
 * billing/shipping name, street line, postcode, "Huisnummer" value or e-mail address selects
 * that text and copies it to the clipboard. No layout or visual change: the
 * script only wraps text in inline spans and shows a small toast.
 *
 * Closures only, no named declarations (same reason as szm-woo-suite.php: PHP
 * binds named functions at compile time, a closure cannot trigger a redeclare).
 * Customer data is never output by PHP, logged or sent anywhere; it is only
 * read client-side from the already rendered order screen.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_enqueue_scripts', function () {
	if ( ! current_user_can( 'manage_woocommerce' ) && ! current_user_can( 'edit_shop_orders' ) ) {
		return;
	}
	if ( ! function_exists( 'get_current_screen' ) ) {
		return;
	}
	$screen = get_current_screen();
	if ( ! $screen ) {
		return;
	}

	// Classic: post.php?post=ID&action=edit (and post-new.php) -> screen id "shop_order".
	// HPOS: admin.php?page=wc-orders&action=edit|new&id=ID -> screen id "woocommerce_page_wc-orders",
	// the same id as the order list, so also require action=edit|new (read-only, compared to a fixed list).
	$is_order_screen = false;
	if ( 'shop_order' === $screen->id ) {
		$is_order_screen = true;
	} else {
		$hpos_id = function_exists( 'wc_get_page_screen_id' ) ? wc_get_page_screen_id( 'shop-order' ) : 'woocommerce_page_wc-orders';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only screen detection.
		$action = isset( $_GET['action'] ) ? sanitize_key( wp_unslash( $_GET['action'] ) ) : '';
		if ( $screen->id === $hpos_id && in_array( $action, array( 'edit', 'new' ), true ) ) {
			$is_order_screen = true;
		}
	}
	if ( ! $is_order_screen ) {
		return;
	}

	$rel  = 'assets/order-click-to-copy.js';
	$path = dirname( __DIR__ ) . '/' . $rel;
	$ver  = defined( 'SZM_WOO_SUITE_VERSION' ) ? SZM_WOO_SUITE_VERSION : '1';
	if ( file_exists( $path ) ) {
		$ver .= '.' . filemtime( $path );
	}
	wp_enqueue_script(
		'szm-woo-order-click-to-copy',
		plugins_url( $rel, SZM_WOO_SUITE_PLUGIN_FILE ),
		array(),
		$ver,
		true
	);
	wp_localize_script(
		'szm-woo-order-click-to-copy',
		'szmWooCtc',
		array(
			'title'  => __( 'Klik om te kopiëren', 'szm-woo-suite' ),
			'copied' => __( 'Gekopieerd:', 'szm-woo-suite' ),
			'failed' => __( 'Kopiëren mislukt', 'szm-woo-suite' ),
		)
	);
} );
