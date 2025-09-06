<template>
	<view class="navbar">
		<view class="navbar-box flex flex-ai-center">
			<image src="/static/icons/switch.svg" class="switchIcon" mode="aspectFill"></image>
			<text>无畏契约</text>
		</view>
	</view>
</template>

<script setup>

</script>

<style lang="scss">
.navbar{
	height: 50rpx;
	display: flex;
	.navbar-box{
		width: auto;
		border: 1px solid #f2f2f2;
		border-radius: 20rpx;
		.switchIcon{
			width: 35rpx;
			height: 35rpx;
		}
	}
}
</style>
